import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("Should create a new user", async () => {
  const newUser = await prisma.user.create({
    data: {
      username: "jest_user233",
      email: "jest_user233@example.com",
      hashedMasterPassword: "hashed_password_example",
    },
  });

  expect(newUser).toHaveProperty("id");
  expect(newUser.username).toBe("jest_user233");

  // Clean up after test
  await prisma.user.delete({ where: { id: newUser.id } });
});