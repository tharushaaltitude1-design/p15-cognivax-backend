import { createFileRoute, Outlet } from '@tanstack/react-router';
export const Route=createFileRoute('/evidence/$id')({component:()=> <Outlet/>});
