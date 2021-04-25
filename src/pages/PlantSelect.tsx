import React, { useEffect, useState } from 'react';
import { 
    StyleSheet,
    View,
    Text,
    FlatList,
    ActivityIndicator
} from 'react-native';

import { Header } from '../components/Header';
import { EnvaiormentButton } from '../components/EnvaiormentButton';
import colors from '../styles/colors';
import fonts from '../styles/fonts';
import api from '../services/api';
import { PlantCardPrimary } from '../components/PlantCardPrimary';
import { Load } from '../components/Load'
import { useNavigation } from '@react-navigation/core';
import { PlantProps } from '../libs/storage';

interface EnvaiormentProps {
    key: string;
    title: string;
}


export function PlantSelect(){
    const [envaiorments, setEnvaiorments] = useState<EnvaiormentProps[]>([]);
    const [plants, setPlants] = useState<PlantProps[]>([]);
    const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([]);
    const [envaiormentSelected, setEnvaiormentSelected] = useState('all')
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const navigation = useNavigation();

    function handleEnvaiormentSelected(envaiorments: string){
        setEnvaiormentSelected(envaiorments);

        if(envaiorments == 'all')
            return setFilteredPlants(plants)

        const filtered = plants.filter(plant =>
            plant.environments.includes(envaiorments)
        );

        setFilteredPlants(filtered);
    }

    function handleFetchMore(distance: number){
        if(distance < 1)
            return;
        
        setLoadingMore(true);
        setPage(oldValue => oldValue + 1);
        fetchPlants();
    }

    function handlePlantSelect(plant: PlantProps){
        navigation.navigate('PlantSave', { plant });
    }

    async function fetchPlants(){
        const { data } = await api.get(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`);

        if(!data)
            return setLoading(true);

        if(page > 1){
            setPlants(oldValue => [...oldValue, ...data])
            setFilteredPlants(oldValue => [...oldValue, ...data])
        }else {
            setPlants(data);
            setFilteredPlants(data);
        }

        setLoading(false);
        setLoadingMore(false);
    }

    useEffect(() => {
        async function fetchEnvaiorment(){
            const { data } = await api.get('plants_environments?_sort=title&_order=asc');
            setEnvaiorments([
                {
                    key: 'all',
                    title: 'Todos',
                },
                ...data
            ]);
        }

        fetchEnvaiorment();

    },[])

    useEffect(() => {
        fetchPlants();

    },[])

    if(loading)
        return <Load />

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Header />

                <Text style={styles.title}>
                    Em qual ambiente
                </Text>
                <Text style={styles.subtitle}>
                    você quer colocar a sua planta?
                </Text>
            </View>

            <View>
                <FlatList
                    data={envaiorments}
                    keyExtractor={(item) => String(item.key)}
                    renderItem={({ item }) => (
                        <EnvaiormentButton 
                            title={ item.title } 
                            active={item.key == envaiormentSelected}
                            onPress={() => handleEnvaiormentSelected(item.key)}
                        />
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.envaiormentList}
                />
            </View>

            <View style={styles.plants}>
                    <FlatList
                        data={filteredPlants}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => (
                            <PlantCardPrimary 
                                data={ item }
                                onPress={() => handlePlantSelect(item)}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        numColumns={2}
                        contentContainerStyle={styles.plantsList}
                        onEndReachedThreshold={0.1}
                        onEndReached={({ distanceFromEnd}) =>
                            handleFetchMore(distanceFromEnd)
                        }
                        ListFooterComponent={
                            loadingMore
                            ? <ActivityIndicator color={colors.green} />
                            : <></>
                        }
                    />
            </View>

        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: colors.background
    },
    header: {
        paddingHorizontal: 30
    },
    title: {
        fontSize: 17,
        fontFamily: fonts.heading,
        lineHeight: 20,
        marginTop: 15,
        color: colors.heading
    },
    subtitle: {
        fontFamily: fonts.text,
        fontSize: 17,
        lineHeight: 20,
        color: colors.heading
    },
    envaiormentList: {
        height: 40,
        justifyContent: 'center',
        paddingBottom: 5,
        marginLeft: 32,
        marginVertical: 32
    },
    plants: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 32
    },
    plantsList: {
        
    }
});