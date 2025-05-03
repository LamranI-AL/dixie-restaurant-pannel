/** @format */

import { UploadButton } from "@/utils/uploadthing";
import React from "react";

type Props = {};

function CategoryImgUpl({}: Props) {
  return (
    <div>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
}

export default CategoryImgUpl;
