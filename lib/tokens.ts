// ensures unique tokens are generated and dobbles deleted
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { getVerificationTokenByEmail } from "@/data/verification-token";

export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1hour

    //   check for existing Token
    const existingToken = await getVerificationTokenByEmail(email);

    //   delete existing token
    if (existingToken) {
      await db.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }
  //create new token
    const verficationToken = await db.verificationToken.create({
      data: {
        email,
        token,
        expires,
      }
    });
  
    return verficationToken;
  };