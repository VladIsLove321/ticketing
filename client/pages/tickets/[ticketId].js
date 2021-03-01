import { baseURL } from "../../constants";
import axios from "axios";
import { useRequest } from "../../hooks/use-request";
import { useRouter } from "next/router";

const TicketShow = ({ ticket }) => {
  const router = useRouter();
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      router.push("/orders/[orderId]", `/orders/${order.id}`),
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { req } = context;
  const { ticketId } = context.query;
  console.log(ticketId);
  const { data } = await axios
    .get(`${baseURL}/api/tickets/${ticketId}`, {
      headers: req.headers,
    })
    .catch((err) => console.log("ERROR ---------", err));
  return {
    props: {
      ticket: data,
    },
  };
}

export default TicketShow;
