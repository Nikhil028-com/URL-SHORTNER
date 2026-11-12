import Header from "@/components/header";
import {Outlet} from "react-router-dom";

const AppLayout = () => {
  return (
    <div>
      <main className="min-h-screen container">
        {/* // these header and footer files are present in components folder  */}
        <Header />
        {/* // to render all the pages we are using Outlet */}
        <Outlet />
      </main>
      <div className="p-10 text-center bg-gray-800 mt-10">
        Made with 💗 by Nikk
      </div>
    </div>
  );
};

export default AppLayout;
