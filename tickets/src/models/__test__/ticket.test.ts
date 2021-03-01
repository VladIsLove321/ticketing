import { Ticket } from "../ticket";

it("implements optimistic concurrency", async () => {
  const ticket = new Ticket({
    price: 20,
    title: "title",
    userId: "312312321",
  });
  await ticket.save();
  const ticketOne = await Ticket.findById(ticket.id);
  const ticketTwo = await Ticket.findById(ticket.id);
  ticketOne!.set({ price: 30, title: "ticketOne" });
  ticketTwo!.set({ price: 50, title: "ticketTwo" });

  await expect(ticketOne!.save()).resolves.toEqual(ticketOne);
  await expect(ticketTwo!.save()).rejects.toThrow();
});

it("Increments the version number on multiple saves", async () => {
  const ticket = new Ticket({
    price: 30,
    title: "title1",
    userId: "312312321",
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(0);
  ticket.set({
    title: "new Title",
  });
  await ticket.save();
  expect(ticket.version).toEqual(1);
  ticket.set({
    price: 40,
  });
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
