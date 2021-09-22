import React, { FC } from 'react';
import { FlexProps, Flex } from '@chakra-ui/react';

const PaginationContainer: FC<FlexProps> = ({
  children,
  ...flexProps
}) => (
  <Flex
    aria-label="pagination navigation"
    as="nav"
    className="pagination-container"
    {...flexProps}
  >
    {children}
  </Flex>
);

export default PaginationContainer;
