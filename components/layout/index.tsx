"use client";
import { Fragment } from "react";
import { Footer } from "../footer";
import { Nav } from "../navbar/scenes";

export const Layout = ({ children }: any) => {
  return (
    <Fragment>
      <Nav />
      <div className='main-content'>{children}</div>
      <Footer />
    </Fragment>
  );
};
