import { GetStaticPropsContext } from "next";

export default function NotFound(props: {message: string}) {
  return (
    <>
      <h1>404 - Not Found</h1>
    </>
  );
}
export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {message: 'test'}, // will be passed to the page component as props
  }
}