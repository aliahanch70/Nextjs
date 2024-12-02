import React from 'react'
import { Box, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb, Text } from '@chakra-ui/react'

interface SliderProps {
  min: number
  max: number
  step?: number
  defaultValue?: [number, number]
  onChange: (values: [number, number]) => void
}

const PriceSlider: React.FC<SliderProps> = ({ min, max, step = 1, defaultValue = [min, max], onChange }) => {
  const [value, setValue] = React.useState<[number, number]>(defaultValue);

  const handleChange = (values: number[]) => {
    setValue(values as [number, number]);
    onChange(values as [number, number]);
  }

  return (
    <Box pt={6} pb={2}>
      <RangeSlider
        aria-label={['min price', 'max price']}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} />
        <RangeSliderThumb index={1} />
      </RangeSlider>
      <Box display="flex" justifyContent="space-between" mt={2} py={3}>
        <Text fontSize="sm" className='text-gray-100'>${value[0].toFixed(2)}</Text>
        <Text fontSize="sm" className='text-gray-100'>${value[1].toFixed(2)}</Text>
      </Box>
    </Box>
  )
}

export default PriceSlider