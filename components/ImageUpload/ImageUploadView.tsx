import React from 'react';
import { Skeleton } from '@chakra-ui/react';
import Uppy from '@uppy/core';
import { DragDrop, useUppy } from '@uppy/react';

type Props = {
  isLoading: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>;
};

type DragDropEvent = MouseEvent | React.DragEvent<HTMLDivElement>;

export const ImageUploadView = (props: Props) => {
  const { isLoading, onDrop } = props;

  const uppy = useUppy(
    () => new (Uppy as any)({ id: 'image-upload' }),
  );

  const handleOnDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (typeof onDrop === 'function') {
      onDrop(e);
    }
  };

  return (
    <Skeleton speed={0.3} isLoaded={!isLoading}>
      <DragDrop
        width="100%"
        height="150px"
        uppy={uppy}
        note="Remember to press Submit to save collection!"
        onDrop={(e: DragDropEvent) => handleOnDrop(e as React.DragEvent<HTMLDivElement>)}
        locale={{
          strings: {
            // Text to show on the droppable area.
            // `%{browse}` is replaced with a link that opens the system file selection dialog.
            dropHereOr: 'Drop file here, browse does not work', // 'Drop here or %{browse}',
            // Used as the label for the link that opens the system file selection dialog.
          },
        }}
      />
    </Skeleton>
  );
};

export default ImageUploadView;