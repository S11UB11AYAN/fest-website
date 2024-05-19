import React, { useState, useEffect } from "react";
import axios from "axios";
import MediaPlayer from "../../utils/MediaPlayer";
import "./Member.css";
import GoToHome from "../../Home/GoToHome";
import { useAuth } from "../../utils/AuthContext";
import Loader from "../../Loader/Loader";

const Members = () => {
  const [posterDetails, setPosterDetails] = useState([]);
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosterDetails = async () => {
      try {
        const response = await axios.get("/api/v1/posts/");
        if (response.data.success && response.data.data.allPosts) {
          const posters = response.data.data.allPosts.filter(
            (post) => post.category === "member"
          );
          // Sort posters by year in descending order
          posters.sort((a, b) => b.year - a.year);
          setPosterDetails(posters);
        } else {
          setError("Data format is incorrect or no data received");
        }
      } catch (error) {
        setError("Failed to fetch poster details");
      } finally {
        // Set loading to false after 1000 milliseconds
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchPosterDetails();
  }, []);

  const handleDeletePoster = async (posterId) => {
    try {
      await axios.delete(`/api/v1/posts/${posterId}`);
      setPosterDetails((prevPosters) =>
        prevPosters.filter((poster) => poster._id !== posterId)
      );
    } catch (error) {
      console.error("Error deleting poster:", error);
    }
  };

  const groupedPosters = posterDetails.reduce((acc, post) => {
    const { year } = post;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedPosters).sort((a, b) => b - a);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="posters-container">
      <GoToHome />
      <h1>Members</h1>
      {sortedYears.map((year) => (
        <div key={year}>
          <h2>Year: {year}</h2>
          <div className="posters">
            {groupedPosters[year].map((post) => (
              <div key={post._id} className="poster-item">
                <div className="content">
                  {post.contentType === "image" ? (
                    <img
                      className="poster-img"
                      src={post.content}
                      alt="Post content"
                    />
                  ) : (
                    <MediaPlayer
                      content={post.content}
                      description={post.description}
                    />
                  )}
                  <br />
                  <span>{post.title}</span>
                  {isLoggedIn && (
                    <button onClick={() => handleDeletePoster(post._id)}>
                      Delete
                    </button>
                  )}
                </div>
                <p>
                  <strong>Description:</strong> {post.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Members;
