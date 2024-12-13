import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("Should create a new user", async () => {
  const newUser = await prisma.user.create({
    data: {
      username: "jest_user",
      email: "jest_user@example.com",
      hashedMasterPassword: "hashed_password_example",
    },
  });

  expect(newUser).toHaveProperty("id");
  expect(newUser.username).toBe("jest_user");

  // Clean up after test
  await prisma.user.delete({ where: { id: newUser.id } });
});