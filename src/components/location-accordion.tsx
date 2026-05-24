import { Button } from 'react-native';
import type { LocationObj, ContainerObj } from '@/constants/db-interface';
import { Collapsible } from './ui/collapsible';

type Props = {
    loc: LocationObj;
    containers: ContainerObj[];
    onStoragePress: (storageId: number) => void;
};

export const LocationAccordion = ({
    loc,
    containers,
    onStoragePress,
}: Props) => {
    return (
        <Collapsible title={loc.location_name}>
            {containers.map(con => (
                <Button
                    key={con.storage_id}
                    onPress={() => onStoragePress(con.storage_id)}
                    title={con.container}
                />
            ))}
        </Collapsible>
    );
};
