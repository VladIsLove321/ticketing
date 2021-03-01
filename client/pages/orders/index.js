import axios from "axios";
import { baseURL } from "../../constants";

const OrderIndex = ({ orders }) => {
  console.log(orders);
  return (
    <ul>
      {orders.map((order) => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        );
      })}
    </ul>
  );
};

export async function getServerSideProps(context) {
  const { req } = context;
  const { data } = await axios
    .get(`${baseURL}/api/orders`, {
      headers: req.headers,
    })
    .catch((err) => console.log(err));
  return {
    props: {
      orders: data,
    },
  };
}

export default OrderIndex;
