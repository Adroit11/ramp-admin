import Uploader from '@/components/common/uploader';
import { Controller } from 'react-hook-form';

interface FileInputProps {
  control: any;
  name: string;
  multiple?: boolean;
  acceptFile?: boolean;
  helperText?: string;
  defaultValue?: any;
  maxSize?: number;
  disabled?: boolean;
  defaultImage?: string;
}

const FileInput = ({
  control,
  name,
  multiple = true,
  acceptFile = false,
  helperText,
  defaultValue,
  defaultImage,
  maxSize,
  disabled,
}: FileInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      // rules={{
      //   required: { value: true, message: 'This field is required' },
      // }}
      // @ts-ignore
      render={({ field: { ref, ...rest } }) => (
        <Uploader
          {...rest}
          multiple={multiple}
          acceptFile={acceptFile}
          helperText={helperText}
          maxSize={maxSize}
          disabled={disabled}
          defaultImage={defaultImage}
        />
      )}
    />
  );
};

export default FileInput;
