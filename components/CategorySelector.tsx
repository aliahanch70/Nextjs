import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useState } from 'react'

interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
}

// Sample categories for products
const categories = [
  { id: 1, name: 'electronics' },
  { id: 2, name: 'fashion' },
  { id: 3, name: 'Home & Kitchen' },
  { id: 4, name: 'Sports' },
  { id: 5, name: 'Books' },
]

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState('')
  const filteredCategories =
    query === ''
      ? categories
      : categories.filter((category) =>
          category.name.toLowerCase().includes(query.toLowerCase())
        )

  return (
    <div className="w-full lg:w-1/4">
      <Combobox
        value={value}
        onChange={(selectedCategory) => onChange(selectedCategory.name)} // Pass the selected category name back
      >
        <div className="relative">
          <ComboboxInput
            className={clsx(
              'w-full rounded-lg border-none bg-gray-100 dark:bg-gray-800 py-1.5 pr-8 pl-3 text-sm text-black dark:text-white',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-gray-300 dark:data-[focus]:outline-white'
            )}
            displayValue={(category) => category}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Select a category"
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-white/60 group-data-[hover]:text-gray-900 dark:group-data-[hover]:text-white" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          className={clsx(
            'absolute z-10  mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            'transition duration-100 ease-in-out'
          )}
        >
          {filteredCategories.map((category) => (
            <ComboboxOption
              key={category.id}
              value={category}
              className={({ active, selected }) =>
                clsx(
                  'cursor-pointer select-none relative py-2 pl-10 pr-4',
                  active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white',
                  selected ? 'font-semibold' : 'font-normal'
                )
              }
            >
              {({ selected }) => (
                <>
                  <span
                    className={clsx(
                      'block truncate',
                      selected ? 'font-semibold' : 'font-normal'
                    )}
                  >
                    {category.name}
                  </span>
                  {selected ? (
                    <span
                      className={clsx(
                        'absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-white'
                      )}
                    >
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}

export default CategorySelector;
