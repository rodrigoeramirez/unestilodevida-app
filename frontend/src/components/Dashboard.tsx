import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import HubIcon from '@mui/icons-material/Hub';
import {
  AppProvider,
  type Session,
  type Navigation,
} from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import { DashboardPage } from '../pages/DashboardPage';
import { UsuariosPage } from '../pages/UsuariosPage';
import { CelulasPage } from '../pages/CelulasPage';
import { useNavigate } from 'react-router-dom';
import { UserIcon } from 'lucide-react';
import { EditarMisDatosPage } from '../pages/EditarMisDatosPage';
import { CambiarClavePage } from '../pages/CambiarClavePage';
import { ProtectedRoute } from './ProtectedRoute';

const NAVIGATION: Navigation = [
  { segment: 'dashboard', title: 'Dashboard', icon: <DashboardIcon /> },
  { segment: 'usuarios', title: 'Usuarios', icon: <GroupAddIcon /> },
  { segment: 'celulas', title: 'Células', icon: <HubIcon /> },
  {
    segment: 'mi-cuenta',
    title: 'Mi Cuenta',
    icon: <UserIcon />,
    children: [
      { segment: 'modificar-datos', title: 'Modificar mis datos' },
      { segment: 'cambiar-clave', title: 'Cambiar contraseña' },
    ],
  },
];

const demoTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
});

export default function DashboardLayoutAccount() {
  const navigate = useNavigate();
  const router = useDemoRouter('/dashboard');
  const [session, setSession] = React.useState<Session | null>(null);

  // Manejo de sesión
  const authentication = React.useMemo(() => ({
    signIn: () => {
      setSession({
        user: {
          name: `${localStorage.getItem('usuarioNombre') || ''} ${localStorage.getItem('usuarioApellido') || ''}`.trim(),
          email: localStorage.getItem('usuarioEmail') || '',
          image: localStorage.getItem('fotoPerfil') || '',
        },
      });
    },
    signOut: () => {
      localStorage.clear();
      setSession(null);
      navigate('/');
    },
  }), [navigate]);

  // Inicializa sesión
  React.useEffect(() => {
    authentication.signIn();
  }, [authentication]);

  // Renderizado de páginas
  const DemoPageContent = ({ pathname }: { pathname: string }) => {
    switch (pathname) {
      case '/dashboard':
        return <ProtectedRoute  rolesPermitidos={["ADMIN","LIDER","TIMOTEO"]}><DashboardPage /></ProtectedRoute>;
        ;
      case '/usuarios':
        return <ProtectedRoute  rolesPermitidos={["ADMIN"]}> <UsuariosPage /></ProtectedRoute>;
      case '/celulas':
        return <ProtectedRoute  rolesPermitidos={["ADMIN","LIDER","TIMOTEO"]}><CelulasPage /></ProtectedRoute>;
      case '/mi-cuenta/modificar-datos':
        return (
           <ProtectedRoute  rolesPermitidos={["ADMIN","LIDER","TIMOTEO"]}><EditarMisDatosPage id={Number(localStorage.getItem("usuarioId"))} /></ProtectedRoute>
        );
        case '/mi-cuenta/cambiar-clave':
        return (
           <ProtectedRoute  rolesPermitidos={["ADMIN","LIDER","TIMOTEO"]}><CambiarClavePage id={Number(localStorage.getItem("usuarioId"))} /></ProtectedRoute>
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppProvider
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
    >
      <DashboardLayout
        branding={{
          logo: (
            <img
              src="src/assets/logo_unev.png"
              alt="Ministerio Un Estilo de Vida"
              style={{ width: 50, height: 50, borderRadius: '50%' }}
            />
          ),
          title: 'Centro de Administración – Un Estilo de Vida',
          homeUrl: '/dashboard',
        }}
      >
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}
