import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router";

const Main = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        <Header />
        <div className="">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Main;