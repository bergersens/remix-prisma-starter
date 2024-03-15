import { type VariantProps } from "class-variance-authority";
import type { FC, PropsWithChildren } from "react";
import React from "react";
import { v4 as uuid } from "uuid";
import { Command, CommandInput, CommandItem, CommandList } from "./command";
import { Tag, type tagVariants } from "./tag";

type OmittedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "value"
>;

export interface TagInputProps
  extends OmittedInputProps,
    VariantProps<typeof tagVariants> {
  placeholder?: string;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  enableAutocomplete?: boolean;
  autocompleteOptions?: Tag[];

  disabled?: boolean;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;

  value?: string | number | readonly string[] | { id: string; text: string }[];
  autocompleteFilter?: (option: string) => boolean;

  onInputChange?: (value: string) => void;
}

export enum Delimiter {
  Comma = ",",
  Enter = "Enter",
  Space = " ",
}

export const TagInput: FC<PropsWithChildren<TagInputProps>> = (props) => {
  const {
    id,
    placeholder,
    tags,
    setTags,
    enableAutocomplete,
    autocompleteOptions,

    onTagAdd,
    onTagRemove,
    onInputChange,
  } = props;

  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (s: string) => {
    const newValue = s;
    setInputValue(newValue);
    onInputChange?.(newValue);
  };

  const handleSelect = (s: string) => {
    const newTagText = s.trim();

    const newTagId = uuid();

    if (newTagText && !tags.some((tag) => tag.text === newTagText)) {
      setTags([...tags, { id: newTagId, text: newTagText }]);
      onTagAdd?.(newTagText);
    }
    setInputValue("");
  };

  const removeTag = (idToRemove: string) => {
    setTags(tags.filter((tag) => tag.id !== idToRemove));
    onTagRemove?.(tags.find((tag) => tag.id === idToRemove)?.text || "");
  };

  console.log(tags);

  return (
    <div className="w-full flex gap-3 flex-col-reverse">
      <div className="w-full">
        <div className="flex gap-x-3 mb-3">
          {tags.map((tag) => (
            <Tag
              size="lg"
              borderStyle="none"
              tagObj={tag}
              key={tag.id}
              onRemoveTag={removeTag}
            />
          ))}
        </div>

        <Command className="rounded-lg border shadow-md">
          <CommandInput
            variant="large"
            ref={inputRef}
            id={id}
            placeholder={placeholder}
            value={inputValue}
            onValueChange={handleInputChange}
            onKeyDown={(e) => {
              if (
                (e.key === Delimiter.Comma || e.key === Delimiter.Enter) &&
                !autocompleteOptions?.some(({ text }) =>
                  text.includes(inputValue)
                )
              )
                handleSelect(inputValue);
            }}
            autoFocus
            autoComplete={enableAutocomplete ? "on" : "off"}
            list={enableAutocomplete ? "autocomplete-options" : undefined}
          />
          <CommandList>
            {autocompleteOptions
              ?.filter((option) => !tags.some((tag) => tag.id === option.id))
              .map(({ text, id }) => (
                <CommandItem
                  value={text}
                  onSelect={handleSelect}
                  variant="large"
                  key={id}
                >
                  {text}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
      </div>
    </div>
  );
};
