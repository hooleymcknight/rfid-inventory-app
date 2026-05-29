import type { LocationObj, ContainerObj } from '@/constants/db-interface';
import { Collapsible } from './ui/collapsible';
import BasicButton from './basic-button';
import { ButtonSet } from './button-set';
import { capitalizeWords } from '@/constants/helpers';

type Props = {
    loc: LocationObj;
    containers: ContainerObj[];
    onStoragePress: (locationId: number, categoryId: number, storageId: number) => void;
};

export const LocationAccordion = ({
    loc,
    containers,
    onStoragePress,
}: Props) => {
    return (
        <Collapsible title={capitalizeWords(loc.location_name)}>
            <ButtonSet>
                {containers.map(con => (
                    <BasicButton key={con.storage_id}
                        submitHandler={() => { onStoragePress(con.location_id, con.category_id, con.storage_id) }}
                        text={capitalizeWords(con.container)} canSubmit={true}
                        customTextStyles={{ fontSize: 20, lineHeight: 24, margin: 0, paddingVertical: 2 }}
                    />
                ))}
            </ButtonSet>
        </Collapsible>
    );
};