import { StyleSheet, View } from 'react-native';

type Props = {
    children: React.ReactNode;
    alignItems?: 'baseline' | 'center' | 'flex-end' | 'flex-start' | 'stretch';
    justifyContent?: 'center' | 'flex-end' | 'flex-start' | 'space-between' | 'space-around' | 'space-evenly';
};

export const ButtonSet = ({ children, alignItems = 'stretch', justifyContent = 'flex-start' }: Props) => {
    const styles = StyleSheet.create({
        btnSet: {
            display: 'flex',
            flexDirection: 'row',
            gap: 20,
            flexWrap: 'wrap',
            alignItems: `${alignItems}`,
            justifyContent: `${justifyContent}`,
        }
    });

    return (
        <View style={styles.btnSet}>
            {children}
        </View>
    );
};