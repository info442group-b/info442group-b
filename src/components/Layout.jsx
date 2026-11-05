import { NavLink, Outlet} from "react-router-dom";

const links = [
  {to: "/", label:"Home"},
  {to: "/insights", label:"Insights"},
  {to: "/settings", label:"Settings"},
  {to: "/support", label:"Support"},
 ];

export default function Layout() {
  return(
    <>
      <nav aria-label="Main">
        {links.map(({ to, label}) => (
          <NavLink key={to} to={to} end={to=== "/"}>
            {label}
          </NavLink>
        ))}
      </nav>
      <main><Outlet /></main>
    </>
  );
}
