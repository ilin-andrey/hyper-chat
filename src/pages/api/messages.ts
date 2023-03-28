import type { NextApiRequest, NextApiResponse } from "next";

import { generateFakeMessages } from "~/core/messages";
import { Message } from "~/core/messages/types";

type CustomResponse = {
  messages: Array<Message>;
};

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<CustomResponse>
) {
  const messages = generateFakeMessages(5);

  res.status(200).json({ messages });
}
