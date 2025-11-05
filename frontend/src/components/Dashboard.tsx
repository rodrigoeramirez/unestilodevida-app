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
import { DemoProvider, useDemoRouter } from '@toolpad/core/internal';
import { DashboardPage } from '../pages/DashboardPage';
import { UsuariosPage } from '../pages/UsuariosPage';
import { CelulasPage } from '../pages/CelulasPage';
import { UsuarioProvider } from '../context/UsuarioContext';
import { CelulaProvider } from '../context/CelulaContext';
import { useNavigate } from 'react-router-dom';

const NAVIGATION: Navigation = [
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
    {
    segment: 'usuarios',
    title: 'Usuarios',
    icon: <GroupAddIcon />,
  },
  {
    segment: 'celulas',
    title: 'Celulas',
    icon: <HubIcon />,
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname }: { pathname: string }) {
  switch (pathname) {
    case '/dashboard':
      return <DashboardPage />;
    case '/usuarios':
      return <UsuarioProvider><UsuariosPage /></UsuarioProvider>;
    case '/celulas':
      return <UsuarioProvider><CelulaProvider><CelulasPage /></CelulaProvider></UsuarioProvider>;
    default:
      return <DashboardPage />; // fallback
  }
}

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

export default function DashboardLayoutAccount(props: DemoProps) {
  const { window } = props;
  const navigate = useNavigate();
  

  const [session, setSession] = React.useState<Session | null>(null);

  // ✅ Manejo de sesión con datos desde localStorage
  const authentication = React.useMemo(() => {
    const nombreUsuario = `${localStorage.getItem("usuarioNombre") || ""} ${localStorage.getItem("usuarioApellido") || ""}`.trim();
    const emailUsuario = localStorage.getItem("usuarioEmail") || "";
    const fotoPerfilUsuario = localStorage.getItem("fotoPerfil") || "";

    return {
      signIn: () => {
        setSession({
          user: {
            name: nombreUsuario,
            email: emailUsuario,
            image: fotoPerfilUsuario,
          },
        });
      },
      signOut: () => {
        localStorage.clear();
        setSession(null);
        navigate("/"); // redirige al login
      },
    };
  }, [navigate]);

  // ✅ Inicializa sesión al montar
  React.useEffect(() => {
    authentication.signIn();
  }, [authentication]);

  const router = useDemoRouter('/dashboard');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    // Remove this provider when copying and pasting into your project.
    <DemoProvider window={demoWindow}>
      {/* preview-start */}
      <AppProvider
        session={session}
        authentication={authentication}
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout
            branding={{
                logo: (
                <img
                    src="src\assets\logo_unev.png" // tu logo (podés poner una URL o ruta local)
                    alt="Ministerio Un Estilo de Vida"
                    style={{ width: 50, height: 50, borderRadius: '50%' }}
                />
                ),
                title: 'Centro de Administración – Un Estilo de Vida', // el texto que reemplaza “Toolpad”
                homeUrl: '/dashboard', // adónde va cuando hacés clic
            }}
            >
            <DemoPageContent pathname={router.pathname} />
        </DashboardLayout>
      </AppProvider>
      {/* preview-end */}
    </DemoProvider>
  );
}
