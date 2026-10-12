import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';

export const NotFoundPage = () => (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12 text-slate-100">
        <Helmet>
            <title>404 | VehicleHub</title>
        </Helmet>
        <Card className="max-w-lg p-10 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">404</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Page not found</h1>
            <p className="mt-4 text-slate-400">This route doesn’t exist in the marketplace yet. Head back home to continue browsing.</p>
            <Link to="/" className="mt-8 inline-flex">
                <Button>Return home</Button>
            </Link>
        </Card>
    </div>
);
