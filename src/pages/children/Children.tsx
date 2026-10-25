import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PageHeader from "../../components/PageHeader";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { MY_CHILDREN, UserDto } from "../../graphql/operations";
import { initials } from "../../lib/format";

const Children = () => {
  const { data, loading, error } = useQuery<{ myChildren: UserDto[] }>(MY_CHILDREN);
  const children = data?.myChildren ?? [];

  return (
    <>
      <PageHeader title="Mis pupilos" subtitle="Consulta las notas y la asistencia de tus pupilos" />
      {error ? (
        <ErrorState message="No se pudo cargar la información de tus pupilos." />
      ) : loading && !data ? (
        <Spinner />
      ) : children.length === 0 ? (
        <EmptyState
          title="No tienes pupilos asociados"
          description="Solicita al colegio que asocie a tu pupilo con tu RUT de apoderado."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <article key={child.id} className="surface flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content">
                  {initials(child.firstName, child.lastName)}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-neutral">
                    {child.firstName} {child.lastName}
                  </h2>
                  <p className="text-xs text-base-content/60">{child.rut}</p>
                </div>
              </div>
              <Link to={`/pupilos/${child.id}`} className="btn btn-primary btn-sm">
                Ver detalle académico
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
};

export default Children;
