import React from 'react';
import {
  Menu, MenuButton, MenuList, MenuItem, IconButton,
  Badge, HStack, Text, Icon, Tooltip,
} from '@chakra-ui/react';
import { MdHelpOutline, MdCheckCircle, MdPlayCircle } from 'react-icons/md';
import { useDemo } from '../../context/DemoContext';

const DemoLauncher = ({ size = 'sm', variant = 'ghost', colorScheme = 'gray', context }) => {
  const { startTour, tourList } = useDemo();
  const filteredTours = context
    ? tourList.filter(t => t.context === context)
    : tourList;
  const completedCount = filteredTours.filter(t => t.completed).length;

  if (filteredTours.length === 0) return null;

  return (
    <Menu>
      <Tooltip label="Interactive Guide" fontSize="xs">
        <MenuButton
          as={IconButton}
          icon={<MdHelpOutline />}
          size={size}
          variant={variant}
          colorScheme={colorScheme}
          aria-label="Start guided tour"
        />
      </Tooltip>
      <MenuList minW="240px">
        {filteredTours.map(tour => (
          <MenuItem
            key={tour.id}
            onClick={() => startTour(tour.id)}
            icon={<Icon as={tour.completed ? MdCheckCircle : MdPlayCircle} color={tour.completed ? 'green.400' : 'blue.400'} />}
          >
            <HStack justify="space-between" w="100%">
              <Text fontSize="sm">{tour.title}</Text>
              <Badge fontSize="2xs" colorScheme={tour.completed ? 'green' : 'gray'}>
                {tour.stepCount} steps
              </Badge>
            </HStack>
          </MenuItem>
        ))}
        {completedCount === filteredTours.length && completedCount > 0 && (
          <MenuItem fontSize="xs" color="gray.500" isDisabled>
            All tours completed!
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};

export default DemoLauncher;
