import { Sidebar } from "flowbite-react";
import React from "react";
import { HiArrowSmRight, HiUser } from "react-icons/hi";
import { Link } from "react-router-dom";

const DashSidebar = (props) => {
  const { tab } = props || {};

  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              className="cursor-pointer"
              active={tab === "profile"}
              icon={HiUser}
              label="User"
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>
          <Sidebar.Item icon={HiArrowSmRight} className="cursor-pointer">
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};

export default DashSidebar;
