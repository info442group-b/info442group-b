import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <nav aria-label="Main navigation">
        <NavLink to="/home">Home</NavLink>{" "}
        <NavLink to="/check-in">Check-in</NavLink>{" "}
        <NavLink to="/insights">Insights</NavLink>{" "}
        <NavLink to="/settings">Settings</NavLink>{" "}
        <NavLink to="/support">Support</NavLink>
      </nav>

      <Outlet />
    </>
  );
}