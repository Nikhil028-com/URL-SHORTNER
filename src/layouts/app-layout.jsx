import Header from "@/components/header";
import {Outlet} from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-background text-foreground">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* // these header and footer files are present in components folder  */}
        <Header />
        {/* // to render all the pages we are using Outlet */}
        <Outlet />
      </main>
      <div className="p-8 text-center bg-gray-800/80 mt-12 w-full text-sm text-gray-400">
        Made with 💗 by Nikk
      </div>
    </div>
  );
};

export default AppLayout;
