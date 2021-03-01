import { baseURL } from "../../constants";
import axios from "axios";
import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import { useRequest } from "../../hooks/use-request";
import { Router, useRouter } from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <h1>OrderExpired</h1>;
  }

  return (
    <div>
      <h3>{timeLeft} seconds until order expires </h3>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51IP9o3JlkGEAVFuFc3EbxSuhFHiRXUZSlsupxBKgFUJX9OxaCToS3K8MKPAT4qjg6w8Sx313PQqkg2P6T4F4cQtz00vesyyPUL"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

export async function getServerSideProps(context) {
  const { orderId } = context.query;
  const { req } = context;
  const { data } = await axios
    .get(`${baseURL}/api/orders/${orderId}`, {
      headers: req.headers,
    })
    .catch((err) => console.log(err));
  return {
    props: {
      order: data,
    },
  };
}

export default OrderShow;
