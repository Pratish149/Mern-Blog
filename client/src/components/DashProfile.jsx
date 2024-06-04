import axios from "axios";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, Modal, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { app } from "../firebase";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  updateFailure,
  updateStart,
  updateSuccess,
} from "../redux/user/userSlice";

const DashProfile = () => {
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imageFileUploadingProgress, setImageFileUploadingProgress] =
    useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [imageFileUploadingError, setImageFileUploadingError] = useState(null);
  const [formData, setFormData] = useState({});
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const imagePickerRef = useRef();
  const dispatch = useDispatch();

  const { currentUser, error } = useSelector((state) => state.user);
  const { profilePicture, username, email } = currentUser || {};

  useEffect(() => {
    if (profileImageFile) {
      uploadImage();
    }
  }, [profileImageFile]);

  const uploadImage = () => {
    // service firebase.storage {
    //     match /b/{bucket}/o {
    //       match /{allPaths=**} {
    //         allow read
    //         allow write: if
    //         request.resource.size < 2 * 1024 * 1024 &&
    //         request.resource.contentType.matches('image/.*')
    //       }
    //     }
    //   }
    setImageFileUploading(true);
    setImageFileUploadingError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + profileImageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, profileImageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadingProgress(progress.toFixed(0));
      },
      () => {
        setImageFileUploadingError(
          "Could not upload image (File must be less than 2MB)"
        );
        setImageFileUploadingProgress(null);
        setProfileImageFile(null);
        setProfileImage(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setProfileImage(downloadURL);
          setFormData((prev) => ({
            ...prev,
            profilePicture: downloadURL,
          }));
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleImageChange = (e) => {
    setUpdateUserSuccess(null);
    setUpdateUserError(null);
    const imageFile = e.target.files[0];
    if (imageFile) {
      setProfileImageFile(imageFile);
      const imageUrl = URL.createObjectURL(imageFile);
      setProfileImage(imageUrl);
    }
  };

  const handleChange = (e) => {
    setUpdateUserSuccess(null);
    setUpdateUserError(null);
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value.trim() }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setImageFileUploading(true);
    setImageFileUploadingError(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError("Please wait for image to upload");
    }
    try {
      dispatch(updateStart());
      axios
        .put(`/api/user/update/${currentUser._id}`, formData)
        .then((response) => {
          const { status, data, message } = response?.data || {};
          if (status === "SUCCESS") {
            dispatch(updateSuccess(data));
            setUpdateUserSuccess("User's profile updated successfully");
          } else {
            dispatch(updateFailure(message));
            setUpdateUserError(message);
          }
        })
        .catch((error) => {
          const { status, message } = error?.response?.data || {};
          if (status === "FAILED") {
            dispatch(updateFailure(message));
            setUpdateUserError(message);
          }
        });
    } catch (error) {
      dispatch(updateFailure(error?.message));
      setUpdateUserError(error?.message);
    }
  };

  const handleDeleteUser = () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      axios
        .delete(`/api/user/delete/${currentUser._id}`)
        .then((response) => {
          const { status, message } = response?.data || {};
          if (status === "SUCCESS") {
            dispatch(deleteUserSuccess());
          } else {
            dispatch(deleteUserFailure(message));
          }
        })
        .catch((error) => {
          const { status, message } = error?.response?.data || {};
          if (status === "FAILED") {
            dispatch(deleteUserFailure(message));
          }
        });
    } catch (error) {
      dispatch(deleteUserFailure(error?.message));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={imagePickerRef}
          hidden
        />
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => imagePickerRef.current.click()}
        >
          {imageFileUploadingProgress && (
            <CircularProgressbar
              value={imageFileUploadingProgress || 0}
              text={`${imageFileUploadingProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadingProgress / 100
                  })`,
                },
              }}
            />
          )}
          <img
            src={profileImage || profilePicture}
            alt="User"
            className={`rounded-full object-cover w-full h-full border-8 border-[lightgray] ${
              imageFileUploadingProgress &&
              imageFileUploadingProgress < 100 &&
              "opacity-60"
            }`}
          />
        </div>
        {imageFileUploadingError && (
          <Alert color="failure">{imageFileUploadingError}</Alert>
        )}
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={username}
          onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={email}
          onChange={handleChange}
        />
        <TextInput
          type="password"
          id="password"
          placeholder="password"
          onChange={handleChange}
        />
        <Button type="submit" gradientDuoTone="purpleToBlue" outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span onClick={() => setShowModal(true)} className="cursor-pointer">
          Delete Account
        </span>
        <span className="cursor-pointer">Sign Out</span>
      </div>
      {updateUserSuccess && (
        <Alert className="mt-5" color="success">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert className="mt-5" color="failure">
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert className="mt-5" color="failure">
          {error}
        </Alert>
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
              Are you sure you want to delete your account?
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

export default DashProfile;
