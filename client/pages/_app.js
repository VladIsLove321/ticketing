import "bootstrap/dist/css/bootstrap.css";
import { buildRequest } from "../api/buildRequest";
import { Header } from "../components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const request = buildRequest(appContext.ctx);
  const { data } = await request.get("/api/users/currentuser");
  return { currentUser: data.currentUser };
};

export default AppComponent;
