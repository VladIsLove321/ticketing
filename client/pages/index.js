import axios from "axios";

const Welcome = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>you are NOT signed in</h1>
  );
};

export default Welcome;
