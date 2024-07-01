import axios from "axios";
import { Sidebar } from "flowbite-react";
import React from "react";
import { HiArrowSmRight, HiDocumentText, HiUser } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { signOutSuccess } from "../redux/user/userSlice";

const DashSidebar = (props) => {
  const { tab } = props || {};
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const { isAdmin } = currentUser || {};

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
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              className="cursor-pointer"
              active={tab === "profile"}
              icon={HiUser}
              label={isAdmin ? "Admin" : "User"}
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>
          {isAdmin && (
            <Link to="/dashboard?tab=posts">
              <Sidebar.Item
                className="cursor-pointer"
                active={tab === "posts"}
                icon={HiDocumentText}
                as="div"
              >
                Posts
              </Sidebar.Item>
            </Link>
          )}
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
