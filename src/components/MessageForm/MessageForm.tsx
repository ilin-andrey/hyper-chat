import { ChangeEventHandler, FormEventHandler, useState } from "react";

export function MessageForm({
  disabled,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit?: (s: string) => void;
}) {
  const [state, setState] = useState("");

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setState(e.target.value);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    // TODO: process possible errors
    if (onSubmit) {
      // send message to the chat
      onSubmit(state);

      // clear value in textarea if everything is ok
      setState("");
    }
  };

  return (
    <div className="flex items-start space-x-4 mx-4">
      <div className="min-w-0 flex-1">
        <form action="#" className="relative" onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300">
            <label htmlFor="message" className="sr-only">
              Your message...
            </label>
            <textarea
              id="message"
              rows={3}
              name="message"
              className="block w-full resize-none border-0 bg-transparent py-3 px-4 text-gray-900 outline-0 placeholder:text-gray-400 sm:text-sm sm:leading-6"
              placeholder="Add your message..."
              value={state}
              onChange={handleChange}
            />

            {/* Spacer element to match the height of the toolbar */}
            <div className="py-2" aria-hidden="true">
              {/* Matches height of button in toolbar (1px border + 36px content height) */}
              <div className="py-px">
                <div className="h-9" />
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pl-3 pr-2">
            <div className="flex-shrink-0">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-75 disabled:pointer-events-none"
                disabled={disabled || state.length === 0}
              >
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
