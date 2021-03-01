import axios from "axios";
import { baseURL } from "../constants";
import Link from "next/link";

const Welcome = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });
  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { req } = context;
  const { data } = await axios
    .get(`${baseURL}/api/tickets`, {
      headers: req.headers,
    })
    .catch((err) => console.log(err));
  return {
    props: {
      tickets: data,
    },
  };
}

export default Welcome;
