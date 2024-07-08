import axios from "axios";
import { Button, Modal, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const DashPosts = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { _id, isAdmin } = currentUser || {};

  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");

  useEffect(() => {
    const apiParams = {
      userId: _id,
    };
    fetchUserPosts(apiParams);
  }, [_id]);

  const fetchUserPosts = async (params) => {
    if (!isAdmin) {
      return; // return if user is not admin
    }

    let queryParams = "";
    Object.keys(params).forEach((key, index) => {
      queryParams += `${index === 0 ? "?" : "&"}${key}=${params[key]}`;
    });
    axios
      .get(`/api/post/getPosts${queryParams}`)
      .then((response) => {
        const { status, posts } = response?.data || {};
        if (status === "SUCCESS") {
          setUserPosts((prev) => [...prev, ...posts]);
          if (posts.length < 9) {
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
      userId: _id,
      startIndex: userPosts.length,
    };
    fetchUserPosts(apiParams);
  };

  const handleDelete = (id) => {
    setShowModal(true);
    setPostIdToDelete(id);
  };

  const handleDeletePost = () => {
    setShowModal(false);
    axios
      .delete(`/api/post/deletepost/${postIdToDelete}/${_id}`)
      .then((response) => {
        const { status, message } = response?.data || {};
        if (status === "SUCCESS") {
          setUserPosts((prev) =>
            prev.filter((post) => post._id !== postIdToDelete)
          );
        } else {
          console.log(message);
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {isAdmin && userPosts?.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Updated</Table.HeadCell>
              <Table.HeadCell>Post Image</Table.HeadCell>
              <Table.HeadCell>Post Title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
            </Table.Head>
            {userPosts?.map((post, index) => {
              const { updatedAt, image, title, slug, category, _id } =
                post || {};
              return (
                <Table.Body className="divide-y" key={String(index)}>
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>
                      {new Date(updatedAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Link to={`/post/${slug}`}>
                        <img
                          src={image}
                          alt={title}
                          className="w-20 h-10 object-cover bg-gray-500"
                        />
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        className="font-medium text-gray-900 dark:text-white"
                        to={`/post/${slug}`}
                      >
                        {title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{category}</Table.Cell>
                    <Table.Cell>
                      <span
                        className="font-medium text-red-500 hover:underline cursor-pointer"
                        onClick={() => handleDelete(_id)}
                      >
                        Delete
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        className="text-teal-500 hover:underline cursor-pointer"
                        to={`/update-post/${slug}`}
                      >
                        <span>Edit</span>
                      </Link>
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
        <p>You have no posts yet!</p>
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
              <Button color="failure" onClick={handleDeletePost}>
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

export default DashPosts;
