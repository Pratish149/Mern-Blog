import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useSelector } from "react-redux";
import { app } from "../firebase";

const DashProfile = () => {
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imageFileUploadingProgress, setImageFileUploadingProgress] =
    useState(null);
  const [imageFileUploadingError, setImageFileUploadingError] = useState(null);

  const imagePickerRef = useRef();

  const { currentUser } = useSelector((state) => state.user);
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
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setProfileImage(downloadURL);
        });
      }
    );
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      setProfileImageFile(imageFile);
      const imageUrl = URL.createObjectURL(imageFile);
      setProfileImage(imageUrl);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-4">
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
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={email}
        />
        <TextInput type="password" id="password" placeholder="password" />
        <Button type="submit" gradientDuoTone="purpleToBlue" outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span className="cursor-pointer">Delete Account</span>
        <span className="cursor-pointer">Sign Out</span>
      </div>
    </div>
  );
};

export default DashProfile;
