import axios from "axios";
import { Button, Modal, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";

const DashUsers = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { isAdmin } = currentUser || {};

  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async (params) => {
    if (!isAdmin) {
      return; // return if user is not admin
    }

    let queryParams = "";
    params &&
      Object.keys(params).forEach((key, index) => {
        queryParams += `${index === 0 ? "?" : "&"}${key}=${params[key]}`;
      });
    axios
      .get(`/api/user/getUsers${queryParams}`)
      .then((response) => {
        const { status, users } = response?.data || {};
        if (status === "SUCCESS") {
          setUsers((prev) => [...prev, ...users]);
          if (users.length < 9) {
            setShowMore(false);
          }
        } else {
          console.log(status);
        }
      })
      .catch((error) => console.log(error));
  };

  const handleShowMore = () => {
    const apiParams = {
      startIndex: users.length,
    };
    fetchUsers(apiParams);
  };

  const handleDelete = (id) => {
    setShowModal(true);
    setUserIdToDelete(id);
  };

  const handleDeleteUser = () => {
    // setShowModal(false);
    // axios
    //   .delete(`/api/post/deletepost/${postIdToDelete}/${_id}`)
    //   .then((response) => {
    //     const { status, message } = response?.data || {};
    //     if (status === "SUCCESS") {
    //       setUserPosts((prev) =>
    //         prev.filter((post) => post._id !== postIdToDelete)
    //       );
    //     } else {
    //       console.log(message);
    //     }
    //   })
    //   .catch((error) => console.log(error));
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {isAdmin && users?.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>User Image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Admin</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {users?.map((post, index) => {
              const {
                createdAt,
                profilePicture,
                username,
                email,
                isAdmin,
                _id,
              } = post || {};
              return (
                <Table.Body className="divide-y" key={String(index)}>
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>
                      {new Date(createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <img
                        src={profilePicture}
                        alt={username}
                        className="w-10 h-10 object-cover bg-gray-500 rounded-full"
                      />
                    </Table.Cell>
                    <Table.Cell>{username}</Table.Cell>
                    <Table.Cell>{email}</Table.Cell>
                    <Table.Cell>
                      {isAdmin ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className="font-medium text-red-500 hover:underline cursor-pointer"
                        onClick={() => handleDelete(_id)}
                      >
                        Delete
                      </span>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              );
            })}
          </Table>
          {showMore && (
            <button
              className="w-full text-teal-500 self-center text-sm py-7"
              onClick={handleShowMore}
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p>You have no users yet!</p>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashUsers;
