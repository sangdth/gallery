import React, { FC, ReactElement, MouseEvent, useMemo } from 'react';
import { Button, Flex, ButtonProps } from '@chakra-ui/react';

// lib
import { SEPARATORS } from './constants';
import { usePaginationContext } from './usePaginationContext';

// components
import FiChevronLeft from './FiChevronLeft';
import FiChevronRight from './FiChevronRight';
import { PaginationSeparator } from './PaginationSeparator';

export type PageProps = {
  page: number
  separator?: ReactElement<ButtonProps>
  _current?: ButtonProps
};

// constants
const buttonStyles: ButtonProps = {
  minW: 'auto',
  px: 1,
  cursor: 'pointer',
};

export const PaginationPage: FC<PageProps & ButtonProps> = ({
  page,
  isDisabled: isDisabledProp,
  separator,
  _current = {},
  ...buttonProps
}) => {
  // provider
  const { actions, state } = usePaginationContext();
  const { changePage } = actions;
  const { currentPage, isDisabled: isDisabledGlobal } = state;

  // memos
  const isCurrent = useMemo(() => currentPage === page, [currentPage, page]);
  const isDisabled = useMemo(
    () => isDisabledProp ?? isDisabledGlobal,
    [isDisabledGlobal, isDisabledProp],
  );
  const isSeparatorDisabled = useMemo(
    () => separator?.props?.isDisabled ?? isDisabledGlobal,
    [isDisabledGlobal, separator?.props?.isDisabled],
  );
  const currentStyles = useMemo(
    () => (isCurrent ? _current : {}),
    [isCurrent, _current],
  );
  const isLeftSeparator = useMemo(() => page === SEPARATORS.left, [page]);
  const isRightSeparator = useMemo(() => page === SEPARATORS.right, [page]);
  const pageLabel = useMemo(
    () => (isCurrent ? `Current page, page ${page}` : `Go to page ${page}`),
    [isCurrent, page],
  );
  const allProps = useMemo(
    () => ({
      ...buttonStyles,
      ...buttonProps,
      ...currentStyles,
      isDisabled,
    }),
    [buttonProps, currentStyles, isDisabled],
  );

  const getPageProps = ({
    onClick,
    isDisabled: isPageDisabled,
    ...props
  }: ButtonProps): ButtonProps => ({
    ...props,
    'aria-disabled': isPageDisabled,
    'aria-current': isCurrent,
    'aria-label': pageLabel,
    isDisabled: isPageDisabled,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      if (!isPageDisabled) {
        onClick?.(event);
      }

      changePage(page);
    },
  });

  if (isLeftSeparator) {
    return (
      <PaginationSeparator
        hoverIcon={FiChevronLeft}
        isDisabled={isSeparatorDisabled}
        separatorPosition="left"
        {...(separator?.props ?? {})}
      />
    );
  }

  if (isRightSeparator) {
    return (
      <PaginationSeparator
        hoverIcon={FiChevronRight}
        isDisabled={isSeparatorDisabled}
        separatorPosition="right"
        {...(separator?.props ?? {})}
      />
    );
  }

  return (
    <Flex as="li">
      <Button className="pagination-page" {...getPageProps(allProps)}>
        {page}
      </Button>
    </Flex>
  );
};
