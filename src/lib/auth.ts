import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcryptjs from "bcryptjs";
import connectDB from "./db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    newUser: "/auth/register",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectDB();
        
        const user = await User.findOne({ 
          email: credentials.email 
        });

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const passwordMatch = await bcryptjs.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          accountType: user.accountType,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.accountType = user.accountType;
      }

      // For Google provider, create or update user
      if (account && account.provider === 'google') {
        await connectDB();
        
        const existingUser = await User.findOne({ email: token.email });
        
        if (existingUser) {
          token.id = existingUser._id.toString();
          token.accountType = existingUser.accountType;
        } else {
          // Create new user with Google account
          const newUser = await User.create({
            email: token.email,
            name: token.name,
            image: token.picture,
            accountType: 'donor', // Default new Google users to donor
          });
          
          token.id = newUser._id.toString();
          token.accountType = newUser.accountType;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.accountType = token.accountType as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user) {
    return null;
  }

  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

export async function requireOrganization() {
  const user = await requireAuth();
  
  if (user.accountType !== 'organization') {
    redirect('/dashboard');
  }
  
  return user;
}

export async function requireDonor() {
  const user = await requireAuth();
  
  if (user.accountType !== 'donor') {
    redirect('/dashboard');
  }
  
  return user;
} 