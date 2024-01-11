import { db } from "@/lib/db";

export const getTwoFactorConfirmationByUserId = async (
  userId: string
) => {
  try {
    const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({
    //   becouse of the connection in db 
        where: { userId }
    });

    return twoFactorConfirmation;
  } catch {
    return null;
  }
};
