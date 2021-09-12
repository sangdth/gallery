import React, { useEffect } from 'react';
import { useMeasure, usePrevious } from 'react-use';
import { useUpdateAtom } from 'jotai/utils';
import { Flex } from '@chakra-ui/react';
import { Carousel } from '@/components';
import { childrenHeightAtom } from '@/lib/jotai';
import type { PageType } from '@/lib/types';

export type MainTemplateProps = {
  page?: PageType;
};

export const MainTemplate = (props: MainTemplateProps) => {
  const { page } = props;
  const [ref, { height }] = useMeasure<HTMLDivElement>();
  const prevHeight = usePrevious(height);
  const updateChildrenHeight = useUpdateAtom(childrenHeightAtom);

  useEffect(() => {
    if (prevHeight !== height) {
      updateChildrenHeight(height);
    }
  }, [prevHeight, height, updateChildrenHeight]);

  if (!page) {
    return <>Error getting page content</>;
  }

  return (
    <Flex ref={ref}>
      {page.collection && (
        <Carousel
          images={page.collection.images}
          sliderWidth={600}
        />
      )}
      {!page.collection && page?.content}
    </Flex>
  );
};

export default MainTemplate;
