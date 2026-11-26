'use client';
import { useParams } from 'next/navigation';
import TicketWorkspace from '../TicketWorkspace';
export default function TicketPage() { const { ticketId } = useParams(); return <TicketWorkspace initialTicketId={ticketId} />; }
