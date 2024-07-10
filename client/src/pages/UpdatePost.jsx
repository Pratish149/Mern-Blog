import axios from "axios";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { app } from "../firebase";

const CreatePost = () => {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [formData, setFormData] = useState({});

  const navigate = useNavigate();
  const { postId } = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (postId) {
      axios
        .get(`/api/post/getPosts?postId=${postId}`)
        .then((response) => {
          const { status, message, posts } = response?.data || {};
          if (status === "SUCCESS") {
            setPublishError(null);
            setFormData(posts[0]);
          } else {
            setPublishError(message);
          }
        })
        .catch((error) => {
          const { message } = error?.response?.data || {};
          setPublishError(message);
        });
    }
  }, [postId]);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        () => {
          setImageUploadError("Image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData((prev) => ({
              ...prev,
              image: downloadURL,
            }));
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      axios
        .put(
          `/api/post/updatepost/${formData._id}/${currentUser._id}`,
          formData
        )
        .then((response) => {
          const { status, post, message } = response?.data || {};
          if (status === "SUCCESS") {
            setPublishError(null);
            navigate(`/post/${post.slug}`);
          } else {
            setPublishError(message);
          }
        })
        .catch((error) => {
          const { message } = error?.response?.data || {};
          setPublishError(message);
        });
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };

  const { title, content, image, category } = formData || {};

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            className="flex-1"
            type="text"
            placeholder="Title"
            id="title"
            required
            value={title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <Select
            value={category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <option value="uncategorized">Select a category</option>
            <option value="javascript">JavaScript</option>
            <option value="reactjs">React.js</option>
            <option value="nextjs">Next.js</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className="h-16 w-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {image && (
          <img src={image} alt="upload" className="w-full h-72 object-cover" />
        )}
        <ReactQuill
          theme="snow"
          value={content}
          placeholder="Write something..."
          className="h-72 mb-12"
          required
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, content: value }))
          }
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Update
        </Button>
        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
