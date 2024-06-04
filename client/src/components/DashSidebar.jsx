import axios from "axios";
import { Sidebar } from "flowbite-react";
import React from "react";
import { HiArrowSmRight, HiUser } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { signOutSuccess } from "../redux/user/userSlice";

const DashSidebar = (props) => {
  const { tab } = props || {};
  const dispatch = useDispatch();

  const handleSignOut = () => {
    try {
      axios
        .post("/api/user/signOut")
        .then((response) => {
          const { status, message } = response?.data || {};
          if (status === "SUCCESS") {
            dispatch(signOutSuccess());
          } else {
            console.log(message);
          }
        })
        .catch((error) => {
          const { status, message } = error?.response?.data || {};
          if (status === "FAILED") {
            console.log(message);
          }
        });
    } catch (error) {
      console.log(error?.message);
    }
  };

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
          <Sidebar.Item
            onClick={handleSignOut}
            icon={HiArrowSmRight}
            className="cursor-pointer"
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};

export default DashSidebar;
