import { Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes, JSX } from 'react';
import { CButton, CButtonGroup } from '@coreui/react-pro';
import { useColorModes } from '@coreui/react-pro'; // Assure-toi que l'import est correct

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { colorMode, setColorMode } = useColorModes('coreui-pro-react-admin-template-theme-modern');

    const tabs: { value: string; icon: JSX.Element; label: string }[] = [
        { value: 'light', icon: <Sun className="me-1 h-4 w-4" />, label: 'Light' },
        { value: 'dark', icon: <Moon className="me-1 h-4 w-4" />, label: 'Dark' },
        { value: 'auto', icon: <Monitor className="me-1 h-4 w-4" />, label: 'System' }, // Remplacer 'system' par 'auto'
    ];


    return (
        <div className={className} {...props}>
            <CButtonGroup role="group">
                {tabs.map(({ value, icon, label }) => (
                    <CButton
                        key={value}
                        color={colorMode === value ? 'primary' : 'secondary'}
                        variant={colorMode === value ? undefined : 'outline'}
                        onClick={() => setColorMode(value)}
                    >
                        {icon}
                        <span className="text-sm">{label}</span>
                    </CButton>
                ))}
            </CButtonGroup>
        </div>
    );
}
