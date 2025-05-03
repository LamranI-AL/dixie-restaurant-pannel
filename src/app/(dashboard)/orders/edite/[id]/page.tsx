/** @format */

import React from "react";

type Props = {
  params: {
    id: string;
  };
};

async function page({ params }: Props) {
  return <div>page of edit {params.id}</div>;
}

export default page;
