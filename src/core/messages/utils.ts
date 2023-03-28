import { faker } from "@faker-js/faker";

import { Message } from "./types";

export function generateFakeMessages(amount: number = 1) {
  let result: Array<Message> = [];

  for (let i = 0; i < amount; i++) {
    result.push({
      author: faker.name.fullName(),
      content: faker.lorem.lines(),
      createdAt: faker.date.past(),
    });
  }

  return result;
}
